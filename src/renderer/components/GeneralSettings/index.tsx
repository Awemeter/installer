import React, { useState } from 'react';
import store from '../../redux/store';
import Store from 'electron-store';
import { setupInstallPath } from 'renderer/actions/install-path.utils';
import {
    Container,
    PageTitle,
    SettingItemContent,
    SettingItemName,
    SettingsItem,
    SettingsItems,
    InfoContainer,
    InfoButton, ResetButton
} from './styles';
import { configureInitialInstallPath } from "renderer/settings";
import * as packageInfo from '../../../../package.json';
import * as actionTypes from '../../redux/actionTypes';
import { useTranslation } from "react-i18next";
import { supportedLanguages } from '../../i18n/config';

const settings = new Store;

// eslint-disable-next-line no-unused-vars
function InstallPathSettingItem(props: { path: string, setPath: (path: string) => void }): JSX.Element {
    const { t } = useTranslation();

    async function handleClick() {
        const path = await setupInstallPath();

        if (path) {
            props.setPath(path);
        }
    }

    return (
        <SettingsItem>
            <SettingItemName>{t('SettingsSection.DownloadSettings.InstallDirectory')}</SettingItemName>
            <SettingItemContent onClick={handleClick}>{props.path}</SettingItemContent>
        </SettingsItem>
    );
}

const DisableWarningSettingItem = (props: {disableWarning: boolean, setDisableWarning: CallableFunction}) => {
    const { t } = useTranslation();
    const handleClick = () => {
        const newState = !props.disableWarning;
        props.setDisableWarning(newState);
        settings.set('mainSettings.disableExperimentalWarning', newState);
    };

    return (
        <div className="flex items-center mb-2 mt-2">
            <span className="text-base">{t('SettingsSection.GeneralSettings.DisableVersionWarnings')}</span>
            <input
                type="checkbox"
                checked={props.disableWarning}
                onChange={handleClick}
                className="ml-auto mr-2 w-5 h-5 rounded-sm checked:bg-blue-600 checked:border-transparent"
            />
        </div>
    );
};

const DisableLiveryWarningItem = (props: {disableWarning: boolean, setDisableWarning: CallableFunction}) => {
    const handleClick = () => {
        const newState = !props.disableWarning;
        props.setDisableWarning(newState);
        settings.set('mainSettings.disabledIncompatibleLiveriesWarning', newState);
    };

    return (
        <div className="flex items-center mb-2 mt-2">
            <span className="text-base">Disable Incompatible Livery Warnings</span>
            <input
                type="checkbox"
                checked={props.disableWarning}
                onChange={handleClick}
                className="ml-auto mr-2 w-5 h-5 rounded-sm checked:bg-blue-600 checked:border-transparent"
            />
        </div>
    );
};

const UseCdnSettingItem = (props: {useCdnCache: boolean, setUseCdnCache: CallableFunction}) => {
    const { t } = useTranslation();
    const handleClick = () => {
        const newState = !props.useCdnCache;
        props.setUseCdnCache(newState);
        settings.set('mainSettings.useCdnCache', newState);
    };

    return (
        <div className="flex items-center mb-2 mt-2">
            <span className="text-base">{t('SettingsSection.DownloadSettings.UseCDN')}</span>
            <input
                type="checkbox"
                checked={props.useCdnCache}
                onChange={handleClick}
                className="ml-auto mr-2 w-5 h-5 rounded-sm checked:bg-blue-600 checked:border-transparent"
            />
        </div>
    );
};

const LanguageSettingsItem = () => {
    const { t, i18n } = useTranslation();

    const languages: {value: string, name: string}[] = [];
    supportedLanguages.forEach(element => languages.push({ value: element, name: t('Languages.' + element) }));

    const handleSelect = (language: string) => {
        i18n.changeLanguage(language);
        settings.set('mainSettings.lang', language);
    };

    return (
        <div className="flex flex-row justify-between mt-1 mb-2 mr-2">
            <SettingItemName>{t('SettingsSection.GeneralSettings.Language')}</SettingItemName>
            <select
                value={i18n.language}
                onChange={event => handleSelect(event.currentTarget.value)}
                name="Language"
                id="language-list"
                className="text-base text-white w-40 outline-none bg-navy border-2 border-navy px-2"
            >
                {languages.map(language =>
                    <option value={language.value} key={language.value}>{language.name}</option>)
                }
            </select>
        </div>
    );
};

function index(): JSX.Element {
    const { t, i18n } = useTranslation();

    const [installPath, setInstallPath] = useState<string>(settings.get('mainSettings.msfsPackagePath') as string);
    const [disableVersionWarning, setDisableVersionWarning] = useState<boolean>(settings.get('mainSettings.disableExperimentalWarning') as boolean);
    const [disableLiveryWarning, setDisableLiveryWarning] = useState<boolean>(settings.get('mainSettings.disabledIncompatibleLiveriesWarning') as boolean);
    const [useCdnCache, setUseCdnCache] = useState<boolean>(settings.get('mainSettings.useCdnCache') as boolean);

    const handleReset = async () => {
        settings.clear();
        await i18n.changeLanguage('en');
        setInstallPath(await configureInitialInstallPath());
        settings.set('mainSettings.disableExperimentalWarning', false);
        settings.set('mainSettings.useCdnCache', true);
        setDisableVersionWarning(false);
    };

    return (
        <>
            <Container>
                <PageTitle>{t('SettingsSection.GeneralSettings.Name')}</PageTitle>
                <SettingsItems>
                    <InstallPathSettingItem path={installPath} setPath={setInstallPath} />
                    <DisableWarningSettingItem disableWarning={disableVersionWarning} setDisableWarning={setDisableVersionWarning} />
                    <DisableLiveryWarningItem disableWarning={disableLiveryWarning} setDisableWarning={setDisableLiveryWarning} />
                    <UseCdnSettingItem useCdnCache={useCdnCache} setUseCdnCache={setUseCdnCache} />
                    <LanguageSettingsItem />
                </SettingsItems>
            </Container>
            <InfoContainer>
                <InfoButton onClick={showChangelog}>{packageInfo.version}</InfoButton>
                <ResetButton onClick={handleReset}>{t('SettingsSection.GeneralSettings.ResetToDefault')}</ResetButton>
            </InfoContainer>
        </>
    );
}

const showChangelog = () => {
    store.dispatch({ type: actionTypes.CALL_CHANGELOG, payload: {
        showChangelog: true
    } });
};

export default index;
